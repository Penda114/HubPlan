"use client";

import { useEffect, useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { getIssues, moveIssue, type Column, type Issue } from "./actions";

const COLUMNS: Column[] = ["Backlog", "En cours", "Review", "Terminé"];

export default function Board() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  async function load() {
    setFailed(false);
    try {
      setIssues(await getIssues());
    } catch {
      setFailed(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onDragEnd(result: DropResult) {
    if (!issues || !result.destination) return;
    const column = result.destination.droppableId as Column;
    if (result.source.droppableId === column && result.source.index === result.destination.index) {
      return;
    }
    const number = Number(result.draggableId);
    const moved = issues.find((i) => i.number === number);
    if (!moved || moved.column === column) return;
    setIssues(issues.map((i) => (i.number === number ? { ...i, column } : i)));
    startTransition(async () => {
      try {
        await moveIssue(number, column);
      } catch {
        load();
      }
    });
  }

  if (failed) {
    return (
      <div className="text-center py-20">
        <p className="mb-4">Erreur</p>
        <button
          onClick={load}
          className="border border-neutral-700 rounded px-4 py-2 hover:bg-neutral-800"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (!issues) return <p className="text-neutral-500">Chargement…</p>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-neutral-900 rounded p-2 min-h-[60vh]"
              >
                <h2 className="text-sm font-semibold text-neutral-400 mb-2 px-1">
                  {col} ({issues.filter((i) => i.column === col).length})
                </h2>
                <div className="space-y-2">
                  {issues
                    .filter((i) => i.column === col)
                    .map((issue, index) => (
                      <Draggable draggableId={String(issue.number)} index={index} key={issue.number}>
                        {(p) => (
                          <a
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            href={issue.url}
                            target="_blank"
                            className="block bg-neutral-800 rounded p-2 text-sm hover:bg-neutral-700"
                          >
                            <span className="text-neutral-500 mr-1">#{issue.number}</span>
                            {issue.title}
                          </a>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
