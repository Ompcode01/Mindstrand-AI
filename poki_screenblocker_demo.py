import time
import tkinter as tk
import pygetwindow as gw

# Demo Configuration
TARGET_SITE = "Poki" # The keyword to look for in the window title
TIME_LIMIT_SECONDS = 300 # 5 minutes
CHECK_INTERVAL = 10 # Check every 10 seconds

def block_screen():
    root = tk.Tk()
    root.attributes('-fullscreen', True)
    root.attributes('-topmost', True) # Keep on top
    root.configure(bg='black')
    root.overrideredirect(True) # Remove borders/close buttons

    label = tk.Label(
        root, 
        text="MindShield Intervention:\n\nExcessive gaming detected on Poki.com.\nYour screen is locked to allow for emotional regulation and physical movement.\n\nPlease take a deep breath.", 
        font=('Helvetica', 24), 
        fg='red', 
        bg='black',
        justify='center'
    )
    label.pack(expand=True)

    # For demo purposes, we will close the block after 30 seconds so you aren't permanently locked out.
    # In a real scenario, this would require completing a grounding exercise.
    root.after(30000, root.destroy)
    
    root.mainloop()

def monitor_activity():
    print(f"Started monitoring for '{TARGET_SITE}'. Time limit: {TIME_LIMIT_SECONDS} seconds.")
    accumulated_time = 0
    
    while accumulated_time < TIME_LIMIT_SECONDS:
        try:
            active_window = gw.getActiveWindow()
            if active_window and TARGET_SITE.lower() in active_window.title.lower():
                accumulated_time += CHECK_INTERVAL
                print(f"Gaming detected. Total time: {accumulated_time}/{TIME_LIMIT_SECONDS} seconds.")
            else:
                # Optional: Reset timer if they navigate away, or keep accumulating.
                # Here we just keep accumulating if they return.
                pass
        except Exception as e:
            pass
            
        time.sleep(CHECK_INTERVAL)
        
    print("Time limit exceeded! Triggering screen block.")
    block_screen()

if __name__ == "__main__":
    monitor_activity()
