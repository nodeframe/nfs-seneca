import seneca from '../src';
import sinon from 'sinon';
import expect from 'expect';

const {add,act} = seneca({log:'silent'});

function p1(){
  return new Promise((resolve,reject)=>{
    resolve({role:'withAsync'});
  });
}

function p1e(){
  return new Promise((resolve,reject)=>{
    reject(new Error("Test Error"));
  });
}

describe("add",function(){
  let calleeWithDone = sinon.spy(function(args,done){
    done(null,{role:'withDone'});
  });

  let calleeWithPromise = sinon.spy(function(args){
    return new Promise((resolve,reject)=>{
      resolve({role:'withPromise'});
    });
  });

  let calleeWithReturn = sinon.spy(function(args){
    return {role:'withReturn'};
  });

  let calleeWithAsync = sinon.spy(async function(args){
    return await p1();
  });

  let calleeWithAsyncReturnString = sinon.spy(async function(args){
    return "Test";
  });

  let calleeReturnString = sinon.spy(function(args){
    return "Test";
  });
  
  //Special case
  let calleeWithDoneError = sinon.spy(function(args,done){
    done(new Error("Test Error"));
  });

  let calleeWithPromiseError = sinon.spy(function(args){
    return new Promise((resolve,reject)=>{
      reject(new Error("Test Error"));
    });
  });

  let calleeWithReturnError = sinon.spy(function(args){
    throw new Error("Test Error");
  });

  let calleeWithAsyncError = sinon.spy(async function(args){
    return await p1e();
  });

  let calleeWithAsyncReturnStringError = sinon.spy(async function(args){
    throw new Error("Test Error");
  });

  before(function(){
    add({role:'withDone'},calleeWithDone);
    add({role:'withPromise'},calleeWithPromise);
    add({role:'withReturn'},calleeWithReturn);
    add({role:'withAsync'},calleeWithAsync);
    add({role:'returnWithString'},calleeReturnString); 
    add({role:'withAsyncReturnString'},calleeWithAsyncReturnString);
    add({role:'withDoneError'},calleeWithDoneError);
    add({role:'withPromiseError'},calleeWithPromiseError);
    add({role:'withReturnError'},calleeWithReturnError);
    add({role:'withAsyncError'},calleeWithAsyncError);
    add({role:'withAsyncReturnStringError'},calleeWithAsyncReturnStringError); 
  })

  it("should be able to use done",function(){
    act({role:'withDone'}).then((res)=>{
      expect(calleeWithDone.calledOnce).toEqual(true);
      expect(res).toEqual({role:'withDone'});
    });
  });

  it("should be able to use promise",function(){
    act({role:'withPromise'}).then((res)=>{
      expect(calleeWithPromise.calledOnce).toEqual(true);
      expect(res).toEqual({role:'withPromise'});
    });
  });

  it("should be able to use function with return",function(){
    act({role:'withReturn'}).then((res)=>{
      expect(calleeWithReturn.calledOnce).toEqual(true);
      expect(res).toEqual({role:'withReturn'});
    });
  });

  it("should be able to use async",function(){
    act({role:'withAsync'}).then((res)=>{
      expect(calleeWithAsync.calledOnce).toEqual(true);
      expect(res).toEqual({role:'withAsync'});
    });
  })

   it("should be able to use function with return only string",function(){
    act({role:'returnWithString'}).then((res)=>{
      expect(calleeReturnString.calledOnce).toEqual(true);
      expect(res).toEqual("Test");
    });
  })

  it("should be able to use function with async return only string",function(){
    act({role:'withAsyncReturnString'}).then((res)=>{
      expect(calleeWithAsyncReturnString.calledOnce).toEqual(true);
      expect(res).toEqual("Test");
    });
  })
  // With Error

  it("should be able to use done error",function(){
    act({role:'withDoneError'}).catch((e)=>{
      expect(calleeWithDoneError.calledOnce).toEqual(true);
      expect(e.name).toEqual("Error");
      expect(e.message).toEqual("seneca: Action role:withDoneError failed: Test Error.");
    })
  });
  it("should be able to use function with promise throw error",function(){
    act({role:'withPromiseError'}).catch((e)=>{
      expect(calleeWithPromiseError.calledOnce).toEqual(true);
      expect(e.name).toEqual("Error");
      expect(e.message).toEqual("Test Error");
    })
  });

  it("should be able to use function with return error",function(){
    act({role:'withReturnError'}).catch((e)=>{
      expect(calleeWithReturnError.calledOnce).toEqual(true);
      expect(e.name).toEqual("Error");
      expect(e.message).toEqual("Test Error");
    })
  });

  it("should be able to use with async throw an error",function(){
    act({role:'withAsyncError'}).catch((e)=>{
      expect(calleeWithAsyncError.calledOnce).toEqual(true);
      expect(e.name).toEqual("Error");
      expect(e.message).toEqual("Test Error");
    })
  });

  it("should be able to use with async return string throw an error",function(){
    act({role:'withAsyncReturnStringError'}).catch((e)=>{
      expect(calleeWithAsyncReturnStringError.calledOnce).toEqual(true);
      expect(e.name).toEqual("Error");
      expect(e.message).toEqual("Test Error");
    })
  });
});