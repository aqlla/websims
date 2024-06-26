import { zipWith } from "./fn/zip.js";
/**
 * Addition. Calculates the sum of two vectors of N dimensions.
 *
 * @typeParam {number} NDim the dimensionality of the vectors.
 *
 * @param augend the first vector, the augend.
 * @param addend the second vector, the addend.
 *
 * @returns sum of the provided vectors.
 */
export const add = (augend, addend) => zipWith((a, b) => a + b, augend, addend);
/**
 * Subtraction. Calculates the difference between two vectors of N dimensions.
 *
 * @param minuend the vector to subtract from.
 * @param subtrahend the vector to subtract from the minuend.
 *
 * @returns the vector difference between the minuend and subtrahend.
 */
export const sub = (minuend, subtrahend) => zipWith((a, b) => a - b, minuend, subtrahend);
/**
 * Calculates the product of an N-dimensional vector and a scalar.
 *
 * @param vector the vector-valued multiplicand.
 * @param scalar the scalar-valued multiplier.
 *
 * @returns the product of the vector multiplicand and the scalar multiplier.
 */
export const mul = (vector, scalar) => vector.map(component => component * scalar);
/**
 * Calculates the quotiend of an N-dimensional vector and a scalar.
 *
 * @param vector the vactor-valued dividend.
 * @param scalar the scalar-valued divisor.
 *
 * @returns the quotient of a vector dividend and a scalar divisor.
 */
export const div = (vector, scalar) => {
    if (scalar === 0) {
        console.error("Div by 0");
    }
    return vector.map(component => component / scalar);
};
/**
 * Calculates the dot product of two N-dimensional vectors.
 *
 * @param l
 * @param r
 *
 * @returns the dot product of N-Dim vectors l and r.
 */
export const dot = (l, r) => l.reduce((acc, curr, index) => acc + curr * r[index], 0);
/**
 * Calculates the squared magnitude of an n-dimensional vector.
 *
 * @param vector the vector whose squared magnitude will be found.
 *
 * @returns the square of the magnitude of the provided N-Dimensional vector.
 */
export const magnitudeSquared = (vector) => vector.reduce((acc, val) => acc + val * val, 0);
/**
 * Calculates the magnitude of an n-dimensional vector.
 *
 * @param vector the vector whose magnitude will be found.
 *
 * @returns the magnitude of the provided N-Dimensional vector.
 */
export const magnitude = (vector) => Math.sqrt(magnitudeSquared(vector));
/**
 * Calculates the unit vector of an n-dimensional vector.
 *
 * @param vector the vector to calclulate the unit vector from.
 *
 * @returns the unit vector of the given n-dimensional vector.
 */
export const unit = (vector) => {
    const mag = magnitude(vector);
    return vector.map(val => val / mag);
};
/**
 * Calculates the angle between 2 n-dimensional vectors.
 *
 * @param l one of the vectors
 * @param r the other one of the vectors
 *
 * @returns the angle between the 2 provided n-dimensional vectors.
 */
export const angle = (l, r) => Math.acos(dot(l, r) / (magnitude(l) * magnitude(r)));
/**
 * Calculates the midpoint of 2 n-dimensional vectors.
 *
 * @param l one of the vectors
 * @param r the other one of the vectors
 *
 * @returns the midpoint of the 2 provided n-dimensional vectors.
 */
export const midpoint = (l, r) => zipWith((a, b) => (a + b) / 2, l, r);
/**
 * Represents an N-dimensional vector with type-safe component management.
 * Allows for the creation and manipulation of vectors with a predefined number of dimensions.
 *
 * @typeParam NDim - The dimension of the vector.
 */
export class NDimVector {
    components;
    constructor(...components) {
        this.components = components;
    }
    /**
     * Retrieves a specific item (component) from the vector by its index.
     *
     * @param index The index of the component to retrieve.
     * @returns The value of the component at the specified index.
     */
    getItem(index) {
        return this.components[index];
    }
    /**
     * Provides the length (dimensionality) of the vector.
     *
     * @returns The dimensionality of the vector as NDim.
     */
    get length() {
        return this.components.length;
    }
    /**
     * Returns unwrapped vector components. If a plain array or tuple is received, it will be returned, but
     * if the vector is an instance of this class, the components of the class will be returned.
     *
     * @param vector the vector from which we will retrieve components.
     * @returns if vector is an instance of NDimVector, returns vector.components, else return the tuple.
     */
    static getComponents(vector) {
        return vector instanceof NDimVector ? vector.components : vector;
    }
    static zero(length) {
        return new NDimVector(...Array(length).fill(0));
    }
    get zero() {
        return NDimVector.zero(this.length);
    }
    // ********************** Math Helpers *****************************
    /**
     * Adds another vector to this vector.
     *
     * @param other The vector to add.
     * @returns A new NDimVector representing the sum.
     */
    add(other) {
        const sum = add(this.components, NDimVector.getComponents(other));
        return new NDimVector(...sum);
    }
    /**
     * Subtracts another vector from this vector.
     *
     * @param other The vector to subtract.
     * @returns A new NDimVector representing the difference.
     */
    sub(other) {
        const difference = sub(this.components, NDimVector.getComponents(other));
        return new NDimVector(...difference);
    }
    /**
     * Multiplies this vector by a scalar value.
     *
     * @param scalar The scalar value to multiply by.
     * @returns A new NDimVector representing the product.
     */
    mul(scalar) {
        const product = mul(this.components, scalar);
        return new NDimVector(...product);
    }
    /**
     * Divides this vector by a scalar value.
     *
     * @param scalar The scalar value to divide by.
     * @returns A new NDimVector representing the quotient.
     */
    div(scalar) {
        const quotient = div(this.components, scalar);
        return new NDimVector(...quotient);
    }
    /**
     * Calculates the dot product of this vector with another vector.
     *
     * @param other The vector to calculate the dot product with.
     * @returns The dot product as a number.
     */
    dot(other) {
        return dot(this.components, NDimVector.getComponents(other));
    }
    /**
     * Calculates the magnitude (length) of this vector.
     *
     * @returns The magnitude of the vector as a number.
     */
    get magnitude() {
        return magnitude(this.components);
    }
    get magnitudeSquared() {
        return magnitudeSquared(this.components);
    }
    /**
     * Converts this vector to a unit vector (a vector with magnitude 1).
     *
     * @returns A new NDimVector representing the unit vector.
     */
    get unit() {
        return new NDimVector(...unit(this.components));
    }
    /**
     * Calculates the angle in radians between this vector and another vector.
     *
     * @param other The vector to calculate the angle with.
     * @returns The angle in radians as a number.
     */
    angle(other) {
        return angle(this.components, NDimVector.getComponents(other));
    }
    /**
     * Calculates the midpoint between this vector and another vector.
     *
     * @param other The vector to calculate the midpoint with.
     * @returns A new NDimVector representing the midpoint.
     */
    midpoint(other) {
        const midpointVector = midpoint(this.components, NDimVector.getComponents(other));
        return new NDimVector(...midpointVector);
    }
}
