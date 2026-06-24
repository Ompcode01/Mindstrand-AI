"use client";

import { GlassPanel, RiskBadge, MiniSparkline, DeltaIndicator } from "@/components/shared/risk-ui";
import { UserRiskRow } from "@/lib/types/mhoc";

export function UserRiskTable({
  users
}: {
  users: UserRiskRow[];
}) {
  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <h3 className="text-[10px] font-mono tracking-[0.15em] text-[#e8e6f0] uppercase">
          User Risk Table
        </h3>
        <button className="text-[9px] font-mono text-[#8b8aa0] hover:text-white transition-colors">
          [+ ADD USER]
        </button>
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="soc-table">
          <thead>
            <tr>
              <th className="w-[140px]">USER</th>
              <th className="w-[80px]">SCORE</th>
              <th className="w-[140px]">TREND (7D)</th>
              <th className="w-[100px]">TIER</th>
              <th className="w-[120px]">TOP CONCERN</th>
              <th className="w-[80px]">ALERTS</th>
              <th className="w-[100px]">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id} className="group cursor-pointer">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#7c54ff]/20 text-[#a78bff] flex items-center justify-center text-[10px] font-mono font-bold border border-[#7c54ff]/30">
                      {user.avatar_initials}
                    </div>
                    <span className="text-xs text-[#e8e6f0]">{user.display_name}</span>
                  </div>
                </td>
                <td>
                  <span className="font-mono text-lg font-bold">{Math.round(user.composite_score)}</span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <MiniSparkline data={user.trend_7d} width={50} height={16} />
                    <DeltaIndicator delta={user.delta_24h} />
                  </div>
                </td>
                <td>
                  <RiskBadge tier={user.risk_tier} showPulse={user.risk_tier === 'high' || user.risk_tier === 'critical'} />
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#a78bff] uppercase">{user.top_dimension}</span>
                    <span className="text-xs text-[#e8e6f0]">{Math.round(user.top_score)}</span>
                  </div>
                </td>
                <td>
                  {user.unacknowledged_alerts > 0 ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-mono border border-[#ef4444]/30">
                      {user.unacknowledged_alerts} NEW
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#4a4860]">—</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22d3a0]" />
                    <span className="text-[10px] font-mono text-[#8b8aa0]">Active</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}
