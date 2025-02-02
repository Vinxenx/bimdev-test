import { v4 as uuidv4 } from 'uuid'

export type TaskProgress = "Pending" | "Active" | "Finished"

export interface ITask {
    taskName: string
    taskProgress: TaskProgress
    taskDate: Date
    //projectId: string;
}

export class Task implements ITask {
    taskName: string
    taskProgress: "Pending" | "Active" | "Finished"
    taskDate: Date
    color: string

    //projectId: string;
    ui: HTMLElement;

    //Task internals
    taskId: string;

    constructor(data: ITask) {
        this.taskId = uuidv4();
        this.taskName = data.taskName;
        this.taskProgress = data.taskProgress;
        this.taskDate = data.taskDate;
        this.color = this.setColor();
        //this.projectId = data.projectId;
        this.setUI();
    }

    setColor(): string {
        console.log(this.taskProgress);
    if (this.taskProgress === "Pending") {
        return "rgb(246, 0, 0)";
    } else if (this.taskProgress === "Active") {
        return "rgb(0, 168, 246)";
    } else if (this.taskProgress === "Finished") {
        return "rgb(0, 245, 0)";
    }
    return "rgb(110, 5, 110)"; // Default fallback
}

    setUI() {
        if (!this.ui) {
            this.ui = document.createElement('div');
            this.ui.className = 'todo-item';
            this.ui.id = this.taskId;
        }

        this.ui.style.backgroundColor = this.color;
        this.ui.innerHTML = this.createTaskContent();
        console.log("Aktuelles UI:", this.ui.outerHTML);
    }

    private createTaskContent(): string {return`
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; column-gap: 15px; align-items: center;">
                    <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
                    <p>${this.taskName}</p>
                  </div>
                    <p style="text-wrap: nowrap; margin-left: 10px;">
                        ${this.taskDate.toLocaleString('en-DE', {
                            day: 'numeric',
                            weekday: 'short',
                            month: 'short'
                            
                            
                        }).replace(/([A-Za-z]+)(\s)/, '$1,$2')}
                    </p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;"></div>`
    }
}