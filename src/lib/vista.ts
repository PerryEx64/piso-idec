import { createContext } from 'react'
import { motionValue, type MotionValue } from 'framer-motion'

/** Ángulo opuesto al giro del piso, para que los textos se mantengan derechos al girar. */
export const GiroInversoContexto = createContext<MotionValue<number>>(motionValue(0))
