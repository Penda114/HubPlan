"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
  createWorkItem,
  deleteWorkItem,
  setWorkItemStage,
  updateWorkItem,
} from "./actions";
import TimeTracker from "@/components/time-tracker";
import {
  IMPORTANCES,
  ITEM_TYPES,
  STAGES,
  formatDuration,
  importanceMeta,
  type Importance,
  type ItemType,
  type Option,
  type Stage,
  type WorkItemDTO,
} from "@/lib/types";

type Props = {
  items: WorkItemDTO[];
  categories: Option[];
  boards: Option[];
  designElements: Option[];
  members: { id: string; name: string }[];
  currentUserId: string;
  canEdit: boolean;
};

type FormState = {
  title: string;
  type: ItemType;
  description: string;
  stage: Stage;
  importance: Importance;
  categoryId: string;
  boardId: string;
  designElementId: string;
  assigneeIds: string[];
};

const EMPTY_FORM: FormState = {
  title: "",
  type: "TASK",
  description: "",
  stage: "PLANNED",
  importance: "MEDIUM",
  categoryId: "",
  boardId: "",
  designElementId: "",
  assigneeIds: [],
};

export default function Board(props: Props) {
  const router = useRouter();
  const [items, setItems] = useState<WorkItemDTO[]>(props.items);
  const [prevItems, setPrevItems] = useState(props.items);
  if (prevItems !== props.items) {
    setPrevItems(props.items);
    setItems(props.items);
  }

  const [editing, setEditing] = useState<WorkItemDTO | null>(null);
  const [memberFilter, setMemberFilter] = useState<string>(props.currentUserId);

  const visibleItems = memberFilter
    ? items.filter((i) => i.assigneeIds.includes(memberFilter))
    : items;
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function openCreate() {
    setError(null);
    setForm(EMPTY_FORM);
    setEditing(null);
    setCreating(true);
  }

  function openEdit(item: WorkItemDTO) {
    setError(null);
    setEditing(item);
    setCreating(false);
    setForm({
      title: item.title,
      type: item.type,
      description: item.description ?? "",
      stage: item.stage,
      importance: item.importance,
      categoryId: item.categoryId ?? "",
      boardId: item.boardId ?? "",
      designElementId: item.designElementId ?? "",
      assigneeIds: item.assigneeIds,
    });
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  function submit() {
    const payload = {
      title: form.title,
      type: form.type,
      description: form.description,
      stage: form.stage,
      importance: form.importance,
      categoryId: form.categoryId || null,
      boardId: form.boardId || null,
      designElementId: form.designElementId || null,
      assigneeIds: form.assigneeIds,
    };
    startTransition(async () => {
      try {
        if (editing) await updateWorkItem(editing.id, payload);
        else await createWorkItem(payload);
        closeModal();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  function remove() {
    if (!editing) return;
    startTransition(async () => {
      try {
        await deleteWorkItem(editing.id);
        closeModal();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  function onDragEnd(result: DropResult) {
    if (!props.canEdit || !result.destination) return;
    const stage = result.destination.droppableId as Stage;
    const id = result.draggableId;
    const item = items.find((i) => i.id === id);
    if (!item || item.stage === stage) return;
    setItems(items.map((i) => (i.id === id ? { ...i, stage } : i)));
    startTransition(async () => {
      try {
        await setWorkItemStage(id, stage);
        router.refresh();
      } catch {
        setItems(props.items);
      }
    });
  }

  const modalOpen = creating || editing !== null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-3">
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          Afficher
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-neutral-200"
          >
            <option value={props.currentUserId}>Mes tâches</option>
            <option value="">Toute l&apos;équipe</option>
            {props.members
              .filter((m) => m.id !== props.currentUserId)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </label>
        {props.canEdit && (
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 text-sm font-medium"
          >
            + Nouvelle tâche
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {STAGES.map((col) => {
            const colItems = visibleItems.filter((i) => i.stage === col.id);
            return (
              <Droppable droppableId={col.id} key={col.id} isDropDisabled={!props.canEdit}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-neutral-900 rounded p-2 min-h-[60vh]"
                  >
                    <h2 className="text-sm font-semibold text-neutral-400 mb-2 px-1">
                      {col.label} ({colItems.length})
                    </h2>
                    <div className="space-y-2">
                      {colItems.map((item, index) => (
                        <Draggable
                          draggableId={item.id}
                          index={index}
                          key={item.id}
                          isDragDisabled={!props.canEdit}
                        >
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              onClick={() => openEdit(item)}
                              style={{
                                ...p.draggableProps.style,
                                borderLeftColor: importanceMeta(item.importance).color,
                              }}
                              title={`Importance : ${importanceMeta(item.importance).label}`}
                              className="bg-neutral-800 rounded p-2 text-sm cursor-pointer hover:bg-neutral-700 border-l-2"
                            >
                              <span
                                className="text-[10px] uppercase font-bold tracking-wide"
                                style={{
                                  color: ITEM_TYPES.find((t) => t.id === item.type)?.color,
                                }}
                              >
                                {ITEM_TYPES.find((t) => t.id === item.type)?.label}
                              </span>
                              <p className="leading-snug mt-0.5">{item.title}</p>
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-400 flex-wrap">
                                {item.categoryName && (
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ background: item.categoryColor ?? "#888" }}
                                    />
                                    {item.categoryName}
                                  </span>
                                )}
                                {item.boardName && <span>· {item.boardName}</span>}
                                {item.subtaskCount > 0 && <span>· {item.subtaskCount} sous-tâches</span>}
                                {item.loggedSeconds > 0 && <span>· {formatDuration(item.loggedSeconds)}</span>}
                                {item.assigneeNames.length > 0 && (
                                  <span className="ml-auto">{item.assigneeNames.join(", ")}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 overflow-y-auto z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-lg p-4 mt-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{editing ? "Modifier la tâche" : "Nouvelle tâche"}</h3>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-200">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre"
                className="w-full bg-neutral-800 rounded px-2 py-1.5 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-neutral-400 text-xs">Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ItemType })}
                    className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-neutral-400 text-xs">Importance</span>
                  <select
                    value={form.importance}
                    onChange={(e) => setForm({ ...form, importance: e.target.value as Importance })}
                    className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                  >
                    {IMPORTANCES.map((i) => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-neutral-400 text-xs">Catégorie</span>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                  >
                    <option value="">—</option>
                    {props.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-neutral-400 text-xs">Sprint</span>
                  <select
                    value={form.boardId}
                    onChange={(e) => setForm({ ...form, boardId: e.target.value })}
                    className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                  >
                    <option value="">—</option>
                    {props.boards.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-neutral-400 text-xs">Élément de conception</span>
                  <select
                    value={form.designElementId}
                    onChange={(e) => setForm({ ...form, designElementId: e.target.value })}
                    className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                  >
                    <option value="">—</option>
                    {props.designElements.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block col-span-2">
                  <span className="text-neutral-400 text-xs">Colonne</span>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
                    className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-neutral-400 text-xs">Assignés</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {props.members.map((m) => {
                    const checked = form.assigneeIds.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() =>
                          setForm({
                            ...form,
                            assigneeIds: checked
                              ? form.assigneeIds.filter((id) => id !== m.id)
                              : [...form.assigneeIds, m.id],
                          })
                        }
                        className={`px-2 py-1 rounded text-xs border ${
                          checked
                            ? "bg-blue-600 border-blue-500"
                            : "border-neutral-700 text-neutral-300"
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                  {props.members.length === 0 && (
                    <span className="text-neutral-500 text-xs">Aucun membre</span>
                  )}
                </div>
              </label>

              <label className="block">
                <span className="text-neutral-400 text-xs">Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-neutral-800 rounded px-2 py-1.5 mt-1"
                />
              </label>

              {editing && (
                <div className="border-t border-neutral-800 pt-3">
                  <TimeTracker workItemId={editing.id} />
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                {editing ? (
                  <button
                    type="button"
                    onClick={remove}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Supprimer
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-neutral-700 rounded px-3 py-1.5"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1.5 font-medium"
                  >
                    {editing ? "Enregistrer" : "Créer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
