type TodoId = number;
type TodoValue = string;

type Todo = {
  id: TodoId,
  todo: TodoValue,
  done?: boolean
}

export type { TodoId, TodoValue, Todo };