// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Todo {
        string content;
        bool isCompleted;
        uint256 timestamp;
    }

    Todo[] public todos;
    mapping(address => uint256[]) public userTodos;

    event TodoCreated(uint256 indexed todoId, address indexed user, string content);
    event TodoCompleted(uint256 indexed todoId, address indexed user);
    event TodoDeleted(uint256 indexed todoId, address indexed user);

    function createTodo(string memory _content) public {
        uint256 todoId = todos.length;
        todos.push(Todo({
            content: _content,
            isCompleted: false,
            timestamp: block.timestamp
        }));
        userTodos[msg.sender].push(todoId);
        emit TodoCreated(todoId, msg.sender, _content);
    }

    function toggleTodo(uint256 _todoId) public {
        require(_todoId < todos.length, "Todo does not exist");
        require(isTodoOwner(_todoId), "Not the owner of this todo");
        todos[_todoId].isCompleted = !todos[_todoId].isCompleted;
        emit TodoCompleted(_todoId, msg.sender);
    }

    function deleteTodo(uint256 _todoId) public {
        require(_todoId < todos.length, "Todo does not exist");
        require(isTodoOwner(_todoId), "Not the owner of this todo");
        
        // Remove todo from user's list
        uint256[] storage userTodoList = userTodos[msg.sender];
        for (uint256 i = 0; i < userTodoList.length; i++) {
            if (userTodoList[i] == _todoId) {
                userTodoList[i] = userTodoList[userTodoList.length - 1];
                userTodoList.pop();
                break;
            }
        }
        
        emit TodoDeleted(_todoId, msg.sender);
    }

    function getUserTodos() public view returns (uint256[] memory) {
        return userTodos[msg.sender];
    }

    function getTodo(uint256 _todoId) public view returns (
        string memory content,
        bool isCompleted,
        uint256 timestamp
    ) {
        require(_todoId < todos.length, "Todo does not exist");
        Todo memory todo = todos[_todoId];
        return (todo.content, todo.isCompleted, todo.timestamp);
    }

    function isTodoOwner(uint256 _todoId) public view returns (bool) {
        uint256[] memory userTodoList = userTodos[msg.sender];
        for (uint256 i = 0; i < userTodoList.length; i++) {
            if (userTodoList[i] == _todoId) {
                return true;
            }
        }
        return false;
    }
} 