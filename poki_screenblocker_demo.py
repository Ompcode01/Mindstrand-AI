import time
import tkinter as tk
from tkinter import messagebox
import threading
import ctypes

# Demo Configuration
TARGET_SITE = "Poki"          # Keyword to intercept in window title
ALERT_INTERVAL = 20           # Fire popup alert every 20 seconds
BLOCK_THRESHOLD = 60          # Trigger black screen after 60s (1 min)
COOLDOWN_DURATION = 30        # Mandatory lockout timer in seconds (30s cooldown)
POLL_MS = 200                 # Check active window every 200 milliseconds

def get_active_window_title():
    """Retrieves the active window title on Windows using native OS APIs."""
    try:
        hwnd = ctypes.windll.user32.GetForegroundWindow()
        length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
        buf = ctypes.create_unicode_buffer(length + 1)
        ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
        return buf.value if buf.value else ""
    except Exception:
        return ""

class MindShieldBoundaryEngine:
    """Smart Tab-Specific Boundary Intervention Engine."""
    def __init__(self):
        self.root = tk.Tk()
        self.root.withdraw() # Hide main invisible root

        self.session_gaming_time = 0
        self.cooldown_remaining = COOLDOWN_DURATION
        self.is_locked = False
        self.last_alert_sec = 0

        # Create the reusable intervention overlay window
        self.overlay = tk.Toplevel(self.root)
        self.overlay.title("MindShield AI — Active Digital Boundary Intervention")
        self.overlay.withdraw() # Hidden initially
        self.overlay.configure(bg='black')

        frame = tk.Frame(self.overlay, bg='black')
        frame.pack(expand=True)

        self.header_lbl = tk.Label(
            frame,
            text="🛑 MINDSHIELD DIGITAL BOUNDARY OVERRIDE",
            font=('Helvetica', 26, 'bold'),
            fg='#ff3333',
            bg='black'
        )
        self.header_lbl.pack(pady=10)

        self.timer_lbl = tk.Label(
            frame,
            text=f"Mandatory Cooldown: {COOLDOWN_DURATION}s",
            font=('Helvetica', 42, 'bold'),
            fg='#ffff33',
            bg='black'
        )
        self.timer_lbl.pack(pady=25)

        self.desc_lbl = tk.Label(
            frame,
            text="Excessive gaming detected on Poki.com.\n"
                 "This specific tab is locked to enforce nervous system regulation.\n\n"
                 "👉 You may switch to any other browser tab or application freely during this cooldown.\n"
                 "Returning to Poki.com before the timer expires will re-apply this lock.",
            font=('Helvetica', 16),
            fg='#cccccc',
            bg='black',
            justify='center'
        )
        self.desc_lbl.pack(pady=15)

        # Handle user clicking Close X on overlay
        self.overlay.protocol("WM_DELETE_WINDOW", self.on_overlay_close)

        print("================================================================================")
        print("MindShield AI — Smart Tab-Specific Boundary Engine")
        print("================================================================================")
        print(f" * Target Site    : '{TARGET_SITE}'")
        print(f" * Alert Interval : Every {ALERT_INTERVAL} seconds")
        print(f" * Lockout Limit  : {BLOCK_THRESHOLD} seconds")
        print(f" * Cooldown Timer : {COOLDOWN_DURATION} seconds")
        print("--------------------------------------------------------------------------------")
        print("Monitoring active. Open browser and navigate to Poki.com...")

        self.start_engine()

    def check_is_poki(self, title):
        """Validates if window is actual Poki gameplay tab (excludes terminal & code editor)."""
        if not title:
            return False
        tl = title.lower()
        if TARGET_SITE.lower() not in tl:
            return False
        # Prevent self-referential tracking when looking at PowerShell/CMD/IDE
        ignore_words = ["poki_screenblocker", "powershell", "cmd.exe", "visual studio", "code", "cursor", "antigravity"]
        if any(w in tl for w in ignore_words):
            return False
        return True

    def on_overlay_close(self):
        """Handles Close X clicks without resetting timer if cooldown is unfulfilled."""
        if self.is_locked and self.cooldown_remaining > 0:
            # User tried to close X early before timer expired!
            # Hide overlay so they can switch tabs, BUT DO NOT reset timer!
            self.overlay.withdraw()
            print(f"[Anti-Cheat] Lock window closed early. Timer frozen at {self.cooldown_remaining}s left.")
        elif self.is_locked and self.cooldown_remaining <= 0:
            # User closed window AFTER cooldown hit 00:00!
            # Unlock Poki and reset gaming session timer!
            self.is_locked = False
            self.session_gaming_time = 0
            self.cooldown_remaining = COOLDOWN_DURATION
            self.header_lbl.configure(text="🛑 MINDSHIELD DIGITAL BOUNDARY OVERRIDE", fg='#ff3333')
            self.timer_lbl.configure(text=f"Mandatory Cooldown: {COOLDOWN_DURATION}s", fg='#ffff33')
            self.desc_lbl.configure(
                text="Excessive gaming detected on Poki.com.\n"
                     "This specific tab is locked to enforce nervous system regulation.\n\n"
                     "👉 You may switch to any other browser tab or application freely during this cooldown.\n"
                     "Returning to Poki.com before the timer expires will re-apply this lock."
            )
            self.overlay.withdraw()
            print("[Reset] Cooldown break fulfilled. Poki unlocked for fresh session.\n")

    def show_popup_alert(self, sec):
        def _win():
            top = tk.Toplevel(self.root)
            top.withdraw()
            top.attributes('-topmost', True)
            messagebox.showwarning(
                "MindShield AI — Boundary Alert",
                f"⚠️ Active Gaming Session Warning!\n\n"
                f"Time active on Poki: {sec} seconds.\n"
                f"Tab intervention override applies at {BLOCK_THRESHOLD}s.",
                parent=top
            )
            top.destroy()
        threading.Thread(target=_win, daemon=True).start()

    def start_engine(self):
        self.root.after(POLL_MS, self.poll_window_loop)
        self.root.after(1000, self.sec_clock_loop)
        self.root.mainloop()

    def sec_clock_loop(self):
        """1-second clock managing time accumulation and cooldown countdown."""
        title = get_active_window_title()
        is_poki = self.check_is_poki(title)
        is_overlay = "mindshield ai — active digital boundary" in title.lower()

        if self.is_locked:
            # Only decrement timer when user is actively looking at Poki / Lock overlay
            if is_poki or is_overlay:
                if self.cooldown_remaining > 0:
                    self.cooldown_remaining -= 1
                    self.timer_lbl.configure(text=f"Mandatory Cooldown: {self.cooldown_remaining}s")
                    print(f"[Cooldown Ticking] {self.cooldown_remaining}s remaining...")
                else:
                    self.header_lbl.configure(text="✅ REGULATION COOLDOWN COMPLETE", fg='#33ff33')
                    self.timer_lbl.configure(text="00:00", fg='#33ff33')
                    self.desc_lbl.configure(
                        text="Your nervous system reset window is complete.\n"
                             "You may now close (X) or minimize this window to resume browsing."
                    )
            else:
                # Timer paused while user navigated away to other tabs/apps
                pass

        elif is_poki:
            self.session_gaming_time += 1
            print(f"[Active Gaming] Poki active -> {self.session_gaming_time}/{BLOCK_THRESHOLD}s")

            if self.session_gaming_time > 0 and self.session_gaming_time % ALERT_INTERVAL == 0 and self.session_gaming_time != self.last_alert_sec:
                self.last_alert_sec = self.session_gaming_time
                self.show_popup_alert(self.session_gaming_time)

            if self.session_gaming_time >= BLOCK_THRESHOLD:
                print(f"\n[BOUNDARY REACHED] {BLOCK_THRESHOLD}s limit exceeded. Triggering tab lockout!")
                self.is_locked = True
                self.cooldown_remaining = COOLDOWN_DURATION
                self.snap_overlay_top()

        self.root.after(1000, self.sec_clock_loop)

    def snap_overlay_top(self):
        try:
            if self.overlay.state() == 'withdrawn' or self.overlay.state() == 'iconic':
                self.overlay.deiconify()
            self.overlay.state('zoomed')
        except Exception:
            pass
        self.overlay.lift()
        self.overlay.attributes('-topmost', True)
        self.overlay.focus_force()

    def poll_window_loop(self):
        """Fast 200ms polling to smartly hide overlay when user switches to other tabs."""
        title = get_active_window_title()
        is_poki = self.check_is_poki(title)
        is_overlay = "mindshield ai — active digital boundary" in title.lower()

        if self.is_locked:
            if is_poki:
                # User switched back to Poki tab! Lock screen on top!
                self.snap_overlay_top()
            elif not is_overlay:
                # User switched to another tab (Wikipedia, YouTube) or app (Word)!
                # Withdraw overlay so they can use the rest of their computer!
                if self.overlay.state() != 'withdrawn':
                    self.overlay.withdraw()

        self.root.after(POLL_MS, self.poll_window_loop)

if __name__ == "__main__":
    MindShieldBoundaryEngine()
