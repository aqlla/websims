import { SimLoop } from "./gameloop.js";
import { scale } from "../lib/math.js";
import { MassiveBody, SimulationBody } from "./kinetic-body.js";
import { Drawable, Shape, injectDrawable } from "../ui/drawable.js";
import { NDimVector } from "../lib/vectors/ndim/nvector.js";


type Vec2 = NDimVector<2>

type BodyList = Map<number, MassiveBody<NDim>>;

type SimulationArgs = {
    n: number
    sun?: boolean
    initVelocity?: number
    timeStepSec?: number
}


type NDim = 2
const dimensions: NDim = 2


export class Simulation extends SimLoop {
    private bodies: BodyList = new Map<number, MassiveBody<NDim>>();
    private timeStepSec: number

    private constructor(args: SimulationArgs) {
        super()
        this.timeStepSec = args.timeStepSec ?? 0.1

        // Sun
        if (args.sun ?? false) {
            this.addBody(new MassiveBody<NDim>({
                dimensions: dimensions,
                m: MassiveBody.max_mass * 10000,
                pos: new NDimVector<NDim>(0, 0),
                isStatic: true,
            }));
        }

        for (let i = 0; i < args.n; i++) {
            const pos = this.getRandomPos();
            const distanceFromOrigin = pos.magnitudeSquared;

            console.log("POS: ");

            console.log(pos)

            const body = new MassiveBody({
                dimensions: dimensions,
                pos: pos,
                vel: new NDimVector<NDim>(
                    pos[1], //  / distanceFromOrigin * 300000, 
                    -pos[0]), // / distanceFromOrigin * 300000),
            })

            this.addBody(body);
        }
    }

    public makeBody(args: {}): MassiveBody<NDim> {
        const b = new MassiveBody<NDim>({
            dimensions: dimensions
        })
        return b
    }

    public get zeroVector(): NDimVector<NDim> {
        return new NDimVector<NDim>(0, 0)
    }

    public updatePhysics() {
        this.updateAcceleration2(this.bodies);
        this.updateDerivatives();
    }

    private updateDerivatives() {
        for (const b of this.bodies.values()) {
            b.integrate(this.timeStepSec);
        }
    }

    public updateAcceleration2(bodies: BodyList) {
        const DISTANCE_SCALE = 6500;
        const DISTANCE_MIN = 1;

        const collisions: SimulationBody<NDim>[][] = [];
        const collidedIds: number[] = [];

        const bodyKeys = Array.from(bodies.keys());


        for (const [i, k] of bodyKeys.entries()) {
            const b1 = bodies.get(k)!

            for (let j = i + 1; j < bodyKeys.length; j++) {
                const k2 = bodyKeys[j]
                const b2 = bodies.get(k2)

                if (!b2) continue

                // calculate distance scalar and acc delta factor
                const r: Vec2 = b2.pos.sub(b1.pos)
                const distance = r.magnitude * DISTANCE_SCALE
                const distanceSquared = r.magnitudeSquared

                if (distance < (b1.r + b2.r) * 400) {

                    // collide 
                    // b1.acc = Vec2.zero;
                    // b2.acc = Vec2.zero;
                    const coll = this.getCollisionWith(collisions, b1, b2)
                    collidedIds.push(b1.id, b2.id)

                    if (coll !== null) {
                        if (coll.includes(b1)) {
                            coll.push(b2)
                        } else if (coll.includes(b2)) {
                            coll.push(b1)
                        } else {
                            console.log("wut")
                        }
                    } else {
                        collisions.push([b1, b2])
                    }
                } else {
                    // (m2 / mag^3) * r   || (r / mag^3) * m2
                    //  (16 / 8) * 32     ||  (32 / 8) * 16
                    //      64            ||       64
                    const accFactor = r.div(distanceSquared * distance) //.add(r.div(distanceSquared * distanceSquared));

                    // get acceleration delta for each body
                    if (!b1.isStatic) {
                        const dAcc1 = accFactor.mul(b2.m)
                        b1.acc = b1.acc.add(dAcc1)
                    }

                    if (!b2.isStatic) {
                        const dAcc2 = accFactor.mul(b1.m)
                        b2.acc = b2.acc.sub(dAcc2)
                    }
                }
            }
        }

        if (collisions.length) {
            // console.log(`${collisions.length} collisions`);
            // console.log(collisions)
            // console.log(bodies.size)
            this.handleCollisions(collisions, bodies)
        }
    }

    private getCollisionWith(
            collisions: SimulationBody<NDim>[][], 
            b1: SimulationBody<NDim>, 
            b2: SimulationBody<NDim>): SimulationBody<NDim>[] | null {
        for (const c of collisions) {
            for (const b of c) {
                if (b.eq(b1) || b.eq(b2)) {
                    return c;
                }
            }
        }
        return null;
    }

    private centerOfMass(bodies: SimulationBody<NDim>[]): NDimVector<NDim> {
        const [b1, ...bs] = [...bodies];

        if (b1 === undefined) {
            return new NDimVector<NDim>(0, 0)
        } else if (bs.length === 0) {
            return b1.pos
        } else {
            let mass = b1.m
            let moment = b1.pos.mul(mass)

            for (const b of bs) {
                mass += b.m
                moment = moment.add(b.pos.mul(b.m))
            }

            return moment.div(mass)
        }
    }

    private handleCollisions(collisionLists: SimulationBody<NDim>[][], bodies: BodyList) {
        for (const coll of collisionLists) {
            // check if any are static
            const staticBody = coll.find(b => b.isStatic)
            const isStatic = staticBody !== undefined
            const mass = coll.reduce((acc, b) => acc + b.m, 0)

            const newBody = new MassiveBody({
                dimensions: dimensions,
                m: mass,
                pos: isStatic ? this.zeroVector : this.centerOfMass(coll),
                vel: isStatic ? this.zeroVector : MassiveBody.nCollisionMomentum(coll),
                isStatic: isStatic
            });

            for (const b of coll)
                bodies.delete(b.id)
            bodies.set(newBody.id, newBody);
        }
    }

    public getRandomPos(max = Simulation.max_pos, min = Simulation.min_pos): NDimVector<NDim> {
        let x = scale(Math.random(), max, min);
        let y = scale(Math.random(), max, min);

        if (x < 0) {
            x -= 500;
        } else {
            x += 2000;
        }

        if (y < 0) {
            y -= 2500;
        } else {
            y += 500;
        }

        return new NDimVector<2>(x, y);
    }

    public addBody(body: MassiveBody<NDim>) {
        this.bodies.set(body.id, body);
    }

    public *entities(): IterableIterator<Drawable> {
        for (const b of this.bodies.values())
            yield injectDrawable(Shape.Circle, '#666666')(b)
    }

    // 100.000.000x 
    public static get max_pos(): number {
        return 2000;
    }

    public static get min_pos(): number {
        return -2000;
    }
}