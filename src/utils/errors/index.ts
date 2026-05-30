export class ExhaustiveError extends Error {
  static {
    this.prototype.name = "ExhaustiveError";
  }

  constructor(value: never, message = `Wrong: ${value}`) {
    super(message);
  }
}
