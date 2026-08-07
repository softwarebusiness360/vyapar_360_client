import { restaurant } from "./restaurant";
import { salon } from "./salon";

const definitions = new Map([[restaurant.id, restaurant], [salon.id, salon]]);

export function registerBusinessType(definition) {
  if (!definition?.id || !Array.isArray(definition.capabilities)) {
    throw new TypeError("Business type requires an id and capabilities");
  }
  if (definitions.has(definition.id)) throw new Error(`Business type already registered: ${definition.id}`);
  definitions.set(definition.id, Object.freeze({ ...definition, capabilities: Object.freeze([...definition.capabilities]) }));
}

export const getBusinessType = (id) => definitions.get(id) ?? null;
export const listBusinessTypes = () => [...definitions.values()];
export const CLINIC_BUSINESS_TYPE = "clinic";
