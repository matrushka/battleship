const AVAILABLE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const numberToLetter = (input: number) => {
  const output = AVAILABLE_LETTERS[input - 1];
  if (output === undefined)
    throw new Error(
      `Invalid input: ${input}. Needs to be between 1 and ${AVAILABLE_LETTERS.length}`
    );
  return output;
};

export const letterToNumber = (input: string) => {
  const output = AVAILABLE_LETTERS.indexOf(input);
  if (output === -1) throw new Error(`Invalid input: ${input}.`);
  return output + 1;
};

export const parseCoordinates = (input: string) => {
  if (input.length > 3) throw new Error(`Invalid input: ${input}.`);
  const chars = input.split("");
  const [letter, ...digits] = chars;
  const x = letterToNumber(letter) - 1;
  const y = Number(digits.join("")) - 1;
  return [x, y];
};
