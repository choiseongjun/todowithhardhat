const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TodoList", function () {
  let todoList;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TodoList = await ethers.getContractFactory("TodoList");
    todoList = await TodoList.deploy();
    await todoList.deployed();
  });

  describe("Todo Creation", function () {
    it("Should create a new todo", async function () {
      const content = "Test todo";
      await todoList.createTodo(content);
      
      const todo = await todoList.getTodo(0);
      expect(todo.content).to.equal(content);
      expect(todo.isCompleted).to.equal(false);
    });

    it("Should emit TodoCreated event", async function () {
      const content = "Test todo";
      await expect(todoList.createTodo(content))
        .to.emit(todoList, "TodoCreated")
        .withArgs(0, owner.address, content);
    });
  });

  describe("Todo Completion", function () {
    beforeEach(async function () {
      await todoList.createTodo("Test todo");
    });

    it("Should toggle todo completion status", async function () {
      await todoList.toggleTodo(0);
      let todo = await todoList.getTodo(0);
      expect(todo.isCompleted).to.equal(true);

      await todoList.toggleTodo(0);
      todo = await todoList.getTodo(0);
      expect(todo.isCompleted).to.equal(false);
    });

    it("Should emit TodoCompleted event", async function () {
      await expect(todoList.toggleTodo(0))
        .to.emit(todoList, "TodoCompleted")
        .withArgs(0, owner.address);
    });

    it("Should not allow non-owner to toggle todo", async function () {
      await expect(todoList.connect(addr1).toggleTodo(0))
        .to.be.revertedWith("Not the owner of this todo");
    });
  });

  describe("Todo Deletion", function () {
    beforeEach(async function () {
      await todoList.createTodo("Test todo");
    });

    it("Should delete todo from user's list", async function () {
      await todoList.deleteTodo(0);
      const userTodos = await todoList.getUserTodos();
      expect(userTodos.length).to.equal(0);
    });

    it("Should emit TodoDeleted event", async function () {
      await expect(todoList.deleteTodo(0))
        .to.emit(todoList, "TodoDeleted")
        .withArgs(0, owner.address);
    });

    it("Should not allow non-owner to delete todo", async function () {
      await expect(todoList.connect(addr1).deleteTodo(0))
        .to.be.revertedWith("Not the owner of this todo");
    });
  });

  describe("User Todos", function () {
    it("Should return correct user todos", async function () {
      await todoList.createTodo("Todo 1");
      await todoList.createTodo("Todo 2");
      
      const userTodos = await todoList.getUserTodos();
      expect(userTodos.length).to.equal(2);
      expect(userTodos[0]).to.equal(0);
      expect(userTodos[1]).to.equal(1);
    });

    it("Should return empty array for user with no todos", async function () {
      const userTodos = await todoList.connect(addr1).getUserTodos();
      expect(userTodos.length).to.equal(0);
    });
  });
}); 