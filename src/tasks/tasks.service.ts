import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter-dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const foundTask = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!foundTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return foundTask;
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const deleteResult = await this.taskRepository.delete({
      id,
      userId: user.id,
    });

    console.log(5555, deleteResult);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const taskToUpdate = await this.getTaskById(id, user);
    taskToUpdate.status = status;
    await taskToUpdate.save();

    return taskToUpdate;
  }
}
