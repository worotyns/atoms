import { Atom, PropertiesOnly } from 'atoms';
import { Task } from './task.ts';

export class Board extends Atom<Board> {
  public tasks: Task[] = [];

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  static deserialize(rawValue: PropertiesOnly<Board>) {
    return Object.assign(
      new Board(),
      rawValue,
      {
        tasks: rawValue.tasks.map((task: PropertiesOnly<Task>) => Task.deserialize(task)),
      },
    );
  }
}
