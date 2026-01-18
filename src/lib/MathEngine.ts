export type Operation = '+' | '-' | 'x' | '/'

export interface MathProblem {
    id: string
    question: string
    answer: number
    operation: Operation
    options?: number[] // For multiple choice if needed later
}

export type AgeBand = '6-7' | '8-9' | '10'

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const generateProblem = (ageBand: AgeBand, difficulty: number = 1): MathProblem => {
    // Difficulty 1 = Easy, 2 = Medium, 3 = Hard (can expand)

    let op: Operation = '+'
    let a = 0
    let b = 0

    // Decide Operation based on age and chance
    const rand = Math.random()

    if (ageBand === '6-7') {
        // Mostly + and -
        op = rand > 0.5 ? '-' : '+'

        if (op === '+') {
            // Sum up to 20
            a = randomInt(1, 10)
            b = randomInt(1, 10)
        } else {
            // Sub result positive
            a = randomInt(5, 20)
            b = randomInt(1, a)
        }
    }
    else if (ageBand === '8-9') {
        // + - up to 100, x up to 5/10
        if (rand < 0.4) op = '+'
        else if (rand < 0.8) op = '-'
        else op = 'x'

        if (op === '+') {
            a = randomInt(10, 50)
            b = randomInt(10, 40)
        } else if (op === '-') {
            a = randomInt(20, 99)
            b = randomInt(5, a - 10)
        } else {
            // Simple multiplication (tables 1,2,3,4,5,10)
            const tables = [1, 2, 3, 4, 5, 10]
            a = tables[randomInt(0, tables.length - 1)]
            b = randomInt(1, 10)
        }
    }
    else {
        // Age 10: Full tables, simple division
        if (rand < 0.3) op = '+'
        else if (rand < 0.6) op = '-'
        else if (rand < 0.85) op = 'x'
        else op = '/'

        if (op === '+') {
            a = randomInt(20, 100)
            b = randomInt(20, 100)
        } else if (op === '-') {
            a = randomInt(50, 150)
            b = randomInt(10, a)
        } else if (op === 'x') {
            a = randomInt(2, 10)
            b = randomInt(2, 10)
        } else {
            // Division: ensure integer result
            b = randomInt(2, 10)
            const res = randomInt(2, 10)
            a = b * res
        }
    }

    // Determine Question & Answer
    let answer = 0
    let question = ''

    switch (op) {
        case '+': answer = a + b; break;
        case '-': answer = a - b; break;
        case 'x': answer = a * b; break;
        case '/': answer = a / b; break;
    }

    // Format display (use x instead of *)
    const displayOp = op === 'x' ? '×' : op === '/' ? ':' : op
    question = `${a} ${displayOp} ${b}`

    return {
        id: Math.random().toString(36).substr(2, 9),
        question,
        answer,
        operation: op
    }
}
