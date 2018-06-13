class Task {
    constructor(task_id, func, waitConditions = null) {
        this.id = task_id;
        this.func = func;
        this.paused = false;
        this.waitConditions = waitConditions;
        // this.timeout = 6000000; // 每个任务默认时间
        // this.endTime = 0;
        this.stopped = false;
        this.events = {};
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    stop() {
        this.stopped = true;
    }
}

class TaskManager{
    constructor(){
        this.aliveTasks = {};
        this.intervalTime = 50; // 任务执行循环间隔
        this.runningTask = null; // 正在执行的 Task
        this.events = {};
        this.GenTaskId = GenerateSequence();
        this.interval = setInterval(function(){
            for (var taskId in this.aliveTasks) {
                var task = this.aliveTasks[taskId];
                // 用户显示定义了 timeout 才记录 timeout 字段
                if (task.timeout) {
                    if (task.paused) {
                        task.endTime += this.intervalTime;
                    } else {
                        var now = (new Date()).getTime();
                        if (task.endTime <= now)
                            this.runTask(task);
                    }
                }
            }
        }, this.intervalTime);
    }

    getEndTime(t) {
        return (new Date()).getTime() + t;
    }

    checkTask(task) {
        var status = {};
        task.timeout = undefined;
        for (var cond in task.waitConditions) {
            if (cond.toUpperCase() === 'TIMEOUT') {
                task.timeout = task.waitConditions[cond];
                if ((new Date()).getTime() >= task.endTime) status['TIMEOUT'] = true;
                else status['TIMEOUT'] = false;
                continue;
            }

            try {
                status[cond] = task.waitConditions[cond]();
            } catch (err) {
                console.log(err)
                status[cond] = false;
            }
        }
        return status;
    }

    runTask(task) {
        this.runningTask = task;
        var waitResult = this.checkTask(task);
        /**
         * ret: { value, done }
         */
        for (var r in waitResult) {
            if (waitResult[r] === true) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    task.stopped = true;
                    task.return = ret.value;
                    this.any_task_stopped = true;
                } else {
                    if (task.timeout) task.endTime = this.getEndTime(task.timeout);
                    task.waitConditions = ret.value;
                }
                break;
            }
        }
    }

    run(obj) {
        if (obj) {
            if (!(obj.type in this.events)) this.events[obj.type] = {};
            if (!(obj.id in this.events[obj.type])) this.events[obj.type][obj.id] = obj.data;
        }
        this.any_task_stopped = false; // 任何一个task 的状态改变，都重新 run
        for (var taskId in this.aliveTasks) {
            if (this.aliveTasks[taskId].paused || this.aliveTasks[taskId].stopped)
                continue;
            try {
                this.runTask(this.aliveTasks[taskId]);
            } catch (err) {
                if (err == 'not logined')
                    Notify.error('未登录，请在软件中登录后重试。');
                else
                    console.log(err)
            }
        }
        if (obj) {
            delete this.events[obj.type][obj.id];
        }
        if (this.any_task_stopped)
            this.run();
    }

    add(func) {
        var task_id = this.GenTaskId.next().value;
        var task = new Task(task_id, func);
        this.aliveTasks[task_id] = task;
        this.runningTask = task;
        var ret = task.func.next();
        if (ret.done) {
            task.stopped = true;
            task.return = ret.value;
        } else {
            for (var cond in ret.value) {
                if (cond.toUpperCase() === 'TIMEOUT') {
                    task.timeout = ret.value[cond];
                    task.endTime = getEndTime(task.timeout);
                    break;
                }
            }
            task.waitConditions = ret.value;
        }
        return task;
    }

    remove(task) {
        delete this.aliveTasks[task.id];
    }

    start_task(func){
        if (typeof func === 'function') {

            var args = [];
            if (arguments.length > 1) {
                var len = 1;
                while (len < arguments.length)
                    args.push(arguments[len++]);
            }
            var f = func.apply(null, args);
            if (f.next && (typeof f.next === 'function')) {
                return this.add(f);
            } else {
                console.log('task 参数类型错误');
            }
        } else {
            console.log('task 参数类型错误');
        }
    }

    stop_task(task){
        if (task)
            task.stop();
        return null;
    }

    pause_task(task){
        task.pause();
    }

    resume_task(task){
        task.resume();
    }
}