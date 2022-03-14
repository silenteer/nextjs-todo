import type { Todo, TodoValue, TodoId } from '~/lib/types';

declare module globalThis {
  var store: Record<TodoId, Todo> | undefined;
  var id: number;
}

globalThis.store = globalThis.store || {};
globalThis.id = globalThis.id || 1;

function add(todo: TodoValue) {
  const nextId = globalThis.id++;
  const todoObject: Todo = { id: nextId, todo }

  globalThis.store[nextId] = todoObject;
  return nextId;
}

function get(id: TodoId) {
  return globalThis.store[id];
}

function toggleStatus(id: TodoId) {
  globalThis.store[id].done = !!!globalThis.store[id].done;
}

function list(): Todo[] {
  return Object.values(globalThis.store);
}

export { add, get, toggleStatus, list }