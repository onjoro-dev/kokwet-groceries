import { Types } from "mongoose";
import InventoryMovement, { InventoryMovementKind } from "../models/InventoryMovement";

export async function recordInventoryMovement(input: {
  product: Types.ObjectId | string;
  order?: Types.ObjectId | string;
  actor?: Types.ObjectId | string;
  kind: InventoryMovementKind;
  before: number;
  after: number;
  note?: string;
}) {
  if (input.before === input.after) return;
  try {
    await InventoryMovement.create({
    product: input.product,
    order: input.order,
    actor: input.actor,
    kind: input.kind,
    before: input.before,
    after: input.after,
    delta: input.after - input.before,
    note: input.note,
    });
  } catch (error) {
    console.error("Inventory movement write failed:", (error as Error).message);
  }
}
