// src/utils/random.ts

export function getRandomAmount(min: number = 1, max: number = 10): number {
    // Returns a random integer between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  export function getRandomFloat(min: number = 1, max: number = 10, decimals: number = 2): number {
    const random = Math.random() * (max - min) + min;
    return parseFloat(random.toFixed(decimals));
  }
  