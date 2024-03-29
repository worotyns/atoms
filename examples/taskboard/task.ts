import { Atom, PropertiesOnly } from 'atoms';

export class Task extends Atom<Task> {
  static create(description: string, creator: string) {
    return Object.assign(new Task(), {
      description: description,
      createdDate: new Date(),
      creator: creator,
      voters: [],
      completed: false,
    });
  }

  public description = '';
  public createdDate: Date = new Date();
  public creator = '';
  public voters: string[] = [];
  public completed = false;

  vote(voter: string): string {
    if (!this.voters.includes(voter)) {
      this.voters.push(voter);
      return `${voter} voted for task: ${this.description}`;
    } else {
      throw new Error(`${voter} has already voted for this task.`);
    }
  }

  markAsCompleted(creator: string): string {
    if (this.creator === creator) {
      this.completed = true;
      return `Task "${this.description}" marked as completed by ${creator}`;
    } else {
      throw new Error(
        `Only the creator (${this.creator}) can mark this task as completed.`,
      );
    }
  }

  static deserialize(rawValue: PropertiesOnly<Task>) {
    return Object.assign(
      new Task(),
      {...rawValue, createdDate: new Date(rawValue.createdDate)},
    );
  }
}
