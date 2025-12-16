'use client'
import { Handle, Position } from 'reactflow';
import { GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommitNode({ data, selected }: any) {
  return (
    <div className={cn(
        "px-4 py-3 rounded-xl border bg-card shadow-xl min-w-[200px] transition-all duration-200",
        selected ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105" : "border-border"
    )}>
      {/* Input Handle (Top) */}
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-3 !h-3" />

      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full", selected ? "bg-blue-500/20 text-blue-500" : "bg-muted text-muted-foreground")}>
            <GitCommit className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-mono text-muted-foreground">{data.hash}</span>
            <span className="text-sm font-bold line-clamp-1">{data.message}</span>
            <div className='flex items-center gap-1 mt-1'>
                <img src={data.authorAvatar} className='w-4 h-4 rounded-full' />
                <span className='text-[10px] text-muted-foreground'>{data.author}</span>
            </div>
        </div>
      </div>

      {/* Output Handle (Bottom) */}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-3 !h-3" />
    </div>
  );
}