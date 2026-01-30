'use client';

import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Plus, Clock, User } from 'lucide-react';
import { Task, TaskStatus } from '@/types/crea';
import { supabase } from '@/lib/supabase';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'next', label: 'Next' },
    { id: 'doing', label: 'In Progress' },
    { id: 'done', label: 'Done' },
];

// --- Sortable Item Component ---
function TaskCard({ task, isOverlay = false }: { task: Task, isOverlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isOverlay) {
        return (
            <div className="group bg-zinc-800 border-blue-500/50 border-2 p-4 rounded-lg shadow-2xl cursor-grabbing z-50 opacity-90 rotate-2">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded border border-white/20 text-white/50`}>
                        {task.priority}
                    </span>
                </div>
                <h4 className="text-sm text-zinc-200 font-medium mb-3">{task.title}</h4>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group bg-zinc-900 border border-white/5 p-4 rounded-lg hover:border-blue-500/30 hover:bg-zinc-800 transition-all cursor-move active:cursor-grabbing touch-none"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${task.priority === 'urgent' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                    task.priority === 'high' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                        'border-zinc-700 text-zinc-500'
                    }`}>
                    {task.priority}
                </span>
                <button className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <h4 className="text-sm text-zinc-200 font-medium mb-3">{task.title}</h4>

            <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    <User size={10} />
                    <span>{task.assignee?.username || 'Unknown'}</span>
                </div>
                {task.due_date && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Clock size={12} />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Droppable Column Component ---
function DroppableColumn({
    col,
    tasks
}: {
    col: { id: TaskStatus; label: string },
    tasks: Task[]
}) {
    const { setNodeRef } = useDroppable({
        id: col.id,
    });

    const columnTasks = tasks.filter(t => t.status === col.id);

    return (
        <div
            ref={setNodeRef}
            className="min-w-[300px] flex flex-col h-full bg-zinc-900/10 rounded-xl p-2 border border-white/5"
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-semibold text-zinc-300">{col.label}</h3>
                <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                </span>
            </div>

            {/* Drop Zone Context */}
            <SortableContext
                id={col.id}
                items={columnTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 space-y-3 min-h-[100px]">
                    {columnTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </SortableContext>

            <button className="w-full mt-2 py-2 text-xs text-zinc-600 border border-dashed border-white/5 rounded-lg hover:bg-white/5 hover:text-zinc-400 transition-colors">
                + Add Item
            </button>
        </div>
    );
}

// --- Main Board Component ---
export const TaskBoard = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Sensible drag threshold
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select(`*, assignee:user_profiles!user_id ( username )`)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching tasks for board:', error);
        else if (data) setTasks(data as unknown as Task[]);
        setLoading(false);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find Containers
        // If dropping on a Task, container matches that task's status
        // If dropping on a Column (Droppable), container IS the column ID
        const activeContainer = tasks.find(t => t.id === activeId)?.status;
        const overContainer = (COLUMNS.find(c => c.id === overId)?.id ||
            tasks.find(t => t.id === overId)?.status) as TaskStatus | undefined;

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Move to new container logic
        setTasks((prev) => {
            return prev.map(t => {
                if (t.id === activeId) {
                    return { ...t, status: overContainer };
                }
                return t;
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeContainer = tasks.find(t => t.id === activeId)?.status;
        const overContainer = (COLUMNS.find(c => c.id === overId)?.id ||
            tasks.find(t => t.id === overId)?.status) as TaskStatus | undefined;

        if (activeContainer && overContainer) {
            // Persist to DB if changed
            // (Optimistic update happened in DragOver, so just verify/save)
            // We just ensure DB gets the sync
            await supabase.from('tasks').update({ status: overContainer }).eq('id', activeId);
        }

        setActiveId(null);
    };

    if (loading) return <div className="text-zinc-500 p-4">Loading vectors...</div>;

    const activeTask = tasks.find(t => t.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full flex gap-6 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <DroppableColumn key={col.id} col={col} tasks={tasks} />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};
