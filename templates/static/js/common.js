function format_body(params) {
    var formBody = [];

    for (var property in params) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(params[property]);
        
        formBody.push(encodedKey + "=" + encodedValue);
    }

    return formBody = formBody.join("&");
}


async function get_user_tasks() {
    var tasks = await fetch("http://127.0.0.1:8000/api/v1.0/tasks/get_tasks_by_current_user", {method: "GET", mode: "cors", headers: {"Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')}});

        if (tasks.ok) {
            document.getElementById('content').innerText = "";
            document.getElementById('content').innerHTML = "";
 
            var tasks = await tasks.json();

            for(var task_id in tasks) {
                var subtasks = await fetch("http://127.0.0.1:8000/api/v1.0/subtasks/get_subtasks_by_task_id?base_task_id=" + tasks[task_id]['id'], {method: "POST", mode: "cors", headers: {"Content-Type": 'application/json', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')}});
                var subtasks = await subtasks.json();
                try {
                    var str_subtasks = subtasks.reduce(function (all_subtasks, current_subtask) {return all_subtasks + "<li><img src='static/img/unchecked.png' id='checkmarker_" + current_subtask['id'] + "_" + current_subtask['base_task_id'] + "' onclick='check_task(" + current_subtask['id'] + "," + current_subtask['base_task_id'] + ")'>" + current_subtask['description'] + "</li>"}, [''])
                } catch (err) {
                    console.log(err)
                    str_subtasks = "";
                }
                
                $('#content').append(
                    "<div class='border border-primary rounded p-2 mb-2'>" +
                    "<h2>" + tasks[task_id]['name'] + "</h2>" +
                    "<p>" + tasks[task_id]['description'] + "</p>" +
                    "<ul class='checkmark'>" +
                    str_subtasks + 
                    "<li><div class='row'><div class='col-6'><input type='text' class='form-control mb-2' id='new_subtask_description" + tasks[task_id]['id'] +"'></div><div class='col-2'><button class='btn btn-success' onclick='create_new_subtask("+ tasks[task_id]['id'] +")'>+</button></div></div></li>" + 
                    "</ul>" +
                    "<div class='text-end mg-2'><button class='btn btn-danger' onclick='delete_task(" + tasks[task_id]['id'] +")'>Удалить</button><div>" + 
                    "</div>"
                )
            }
            
            $('#content').append(
                "<div class='border border-primary rounded p-2 mb-2'>" +
                "<input type='text' class='form-control mb-2' id='new_task_name'>" +
                "<textarea class='form-control mb-2' id='new_task_description'></textarea>" +
                "<div class='text-end mg-2'><button class='btn btn-primary' onclick='create_new_task()'>Создать</button><div>" + 
                "</div>"
            )
        }
}


async function check_task(subtask_id, base_task_id) {
    $('#checkmarker_' + subtask_id + '_' + base_task_id).attr('src', 'static/img/checked.png');
    delete_subtask_delayed(subtask_id, base_task_id)
}

async function delete_subtask(args) {
    var subtask_id = args[0]
    var base_task_id = args[1]

    var response = await fetch('http://127.0.0.1:8000/api/v1.0/subtasks/delete_subtask', {method: "POST", mode: "cors", headers: {"Content-Type": 'application/json', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')}, body: JSON.stringify({base_task_id: base_task_id, subtask_id: subtask_id})})
    if (response.ok) {
        get_user_tasks();
    }
}

async function delete_subtask_delayed(subtask_id, base_task_id) {
    setTimeout(delete_subtask, 3000, [subtask_id, base_task_id]);
}


async function create_new_task() {
    var name = $('#new_task_name').val();
    var description =  $('#new_task_description').val();

    var new_task = await fetch("http://127.0.0.1:8000/api/v1.0/tasks/create_new", {method: "POST", mode: "cors", headers: {"Content-Type": 'application/json', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')}, body: JSON.stringify({name: name, description: description})});

    if (new_task.ok) {
        alert('Задача создана!');
        get_user_tasks();
    }
}

async function create_new_subtask(base_task_id) {
    var description =  $('#new_subtask_description' + base_task_id).val();

    var new_task = await fetch("http://127.0.0.1:8000/api/v1.0/subtasks/create_new_subtask", {method: "POST", mode: "cors", headers: {"Content-Type": 'application/json', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')}, body: JSON.stringify({base_task_id: base_task_id, description: description})});

    if (new_task.ok) {
        get_user_tasks();
    }
}


function prepare_user_tasks() {
    var jwt_token = localStorage.getItem('jwt_token')

    if (jwt_token != null) {
        get_user_tasks();
    }
}


async function delete_task(task_id) {
    const response = await fetch("http://127.0.0.1:8000/api/v1.0/tasks/delete_by_uid", {method: "DELETE", mode: "cors", headers: {"Content-Type": 'application/json', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')}, body: JSON.stringify({id: task_id})});

    if (response.ok) {
        alert('Задача удалена.');
        get_user_tasks();
    }
}

async function auth() {
    var auth_data = {
        'username': await $('#login_field').val(),
        'password': await $('#password_field').val(),
    };

    const response = await fetch("http://127.0.0.1:8000/api/v1.0/users/login", {method: "POST", mode: "cors", headers: {"Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1'}, body: format_body(auth_data)});

    if (response.ok) {
        const token_data = await response.json();
        localStorage.setItem('jwt_token', token_data['access_token']);

        get_user_tasks();        
    } else {
        alert('Не удалось войти!');
    }
}


async function register() {
    var auth_data = {
        'username': await $('#login_field').val(),
        'password': await $('#password_field').val(),
    };

    const response = await fetch("http://127.0.0.1:8000/api/v1.0/users/create", {method: "POST", mode: "cors", headers: {"Content-Type": 'application/json', 'Accept': 'application/json', 'Origin': 'http://127.0.0.1'}, body: JSON.stringify(auth_data)});

    if (response.ok) {
        alert('Успешно создан пользователь!');
    }
}
