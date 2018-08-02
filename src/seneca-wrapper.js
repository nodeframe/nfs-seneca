import Promise from 'bluebird';
import _serializeError from "serialize-error"
import _ from "lodash"

export const serializeError = (e)=> {
  try {
    return _serializeError(e)
  } catch (someError) {
    return {name: e.name, stack: e.stack, message: e.message, errors: e.errors}
  }
}

export const deserializeError = (oe)=> {
  const e = new Error(oe.message);
  _.keys(_.omit(oe, ["message"])).forEach((key) => {
    e[key] = oe[key]
  })
  return e;
}

export const actGenerator = (si) => {
  return (args) => {
    return new Promise((resolve, reject)=> {
      si.act(args, function (err, resp) {
        if (err) {
          reject(err);
          return;
        }
        else if (!resp.ok) reject(deserializeError(resp.error));
        else resolve(resp.result);
      });
    });
  }
}

export const addGenerator = (si) => {
  return (options, callback)=> {
    si.add(options, function (args, done) {
      try {
        if (callback.length >= 2) {
          callback.bind(si)(args, done);
        } else {
          const resultWithArgs = callback.bind(si)(args);
          const isThenable = ('function' === typeof resultWithArgs.then);
          if (isThenable) {
            resultWithArgs.then((response)=> {
              done(null, {ok: true, result: response});
            }).catch((e)=> {
              done(null, {ok: false, error: serializeError(e)});
            });
          } else {
            done(null, {ok: true, result: resultWithArgs});
          }
        }
      } catch (e) {
        done(null, {ok: false, error: serializeError(e)});
        return;
      }
    })
  }
}