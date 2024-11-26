import { faker } from "@faker-js/faker";
import ivm from "isolated-vm";

const api = {
  uuid: () => faker.string.uuid(),
  img: () => faker.image.urlLoremFlickr(),
  sentence: () => faker.lorem.sentence(),
  refs: (typeName: string, min: number, max: number) => {
    return [];
  },
};

const isolate = new ivm.Isolate({ memoryLimit: 8 });
const ctx = isolate.createContextSync();

type FunkKey = keyof typeof api;

Object.keys(api).forEach((funcKey: any) => {
  ctx.global.setSync(funcKey, api[funcKey as FunkKey]);
});

export default function gen(code: string) {
  const script = isolate.compileScriptSync(code);
  const result = script.runSync(ctx);
  return result;
}
