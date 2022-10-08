import {roadParam, house,rock,bridge,tree} from './gameElements.js'
import {road} from '../racer.js'

export const generateBumpyRoad = () => {
    const r = Math.random;
    
    for (let i=0; i<2500; i++){
          road.push({
                height: 30*r(),
                curve: 30*r(),
                sprite: '',
              });
            }
          roadParam.length = roadParam.length * roadParam.zoneSize;

        }