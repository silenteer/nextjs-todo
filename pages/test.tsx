import { dehydrate, QueryClient, QueryClientProvider, DehydratedState, Hydrate } from 'react-query';
import { NewTodo, TodoList, SelectedTodo } from './with-react-query-ssr-hydrate';

export default function Test() {
  return <>
    <div style={{ margin: 25 }}>
      <h1>Test</h1>
      <hr />
      <h2>Showcase a selected todo</h2>
      <DemoStateOfSelectedTodo />
      <hr />
      <h2>Showcase of list</h2>
      <DemoStateOfList />
    </div>

  </>
}

const preparedSelectedTodo: [QueryClient, number] = (() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: false
      }
    }
  });
  queryClient.setQueryData(['todos', 1], () => ({ id: 1, todo: 'hello' }));

  return [queryClient, 1];
})();

function DemoStateOfSelectedTodo() {
  const [queryClient, id] = preparedSelectedTodo;
  return <>
    <QueryClientProvider client={queryClient}>
      <SelectedTodo id={id} />
    </QueryClientProvider>
  </>
}

const listWithFewDones: [QueryClient, DehydratedState] = (() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: false
      }
    }
  });
  queryClient.setQueryData(['todos'], () => ({
    todos: [
      { id: 1, todo: 'hello' },
      { id: 2, todo: 'world', done: true }
    ]
  }));

  const serialized = dehydrate(queryClient);
  return [queryClient, serialized];
})();

function DemoStateOfList() {
  const [queryClient, serialized] = listWithFewDones;
  return <>
    <QueryClientProvider client={queryClient}>
      <Hydrate state={serialized}>
        <TodoList onTodoSelected={() => { console.log() }} />
      </Hydrate>
    </QueryClientProvider>
  </>
}