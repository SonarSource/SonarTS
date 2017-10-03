/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

import {Store, Todo, TodoFactory} from './services/TodoStore';

@Component({selector: 'todo-app', viewProviders: [Store, TodoFactory], templateUrl: 'todo.html'})
export class TodoApp {
  todoEdit: Todo = null;
  inputValue: string;
  hideActive: boolean = false;
  hideCompleted: boolean = false;
  isComplete: boolean = false;

  constructor(public todoStore: Store<Todo>, public factory: TodoFactory) {}

  enterTodo(): void {
    this.addTodo(this.inputValue);
    this.inputValue = '';
  }

  doneEditing($event: KeyboardEvent, todo: Todo): void {
    const which = $event.keyCode;
    if (which === 13) {
      todo.title = todo.editTitle;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      todo.editTitle = todo.title;
    }
  }

  editTodo(todo: Todo): void { this.todoEdit = todo; }

  addTodo(newTitle: string): void { this.todoStore.add(this.factory.create(newTitle, false)); }

  completeMe(todo: Todo): void { todo.completed = !todo.completed; }

  toggleCompleted(): void {
    this.hideActive = !this.hideActive;
    this.hideCompleted = false;
  }

  toggleActive(): void {
    this.hideCompleted = !this.hideCompleted;
    this.hideActive = false;
  }

  showAll(): void {
    this.hideCompleted = false;
    this.hideActive = false;
  }

  deleteMe(todo: Todo): void { this.todoStore.remove(todo); }

  toggleAll($event: MouseEvent): void {
    this.isComplete = !this.isComplete;
    this.todoStore.list.forEach((todo: Todo) => { todo.completed = this.isComplete; });
  }

  clearCompleted(): void { this.todoStore.removeBy((todo: Todo) => todo.completed); }
}
