import {DataSet} from "vis";

export function toVisData() {
  return {nodes : new DataSet([
    {id: 1, label : "Start\n&\nEnd", shape: "box"},
    {id: 2, label : "Not Really the \nEnd", shape: "box"},
    ]),
          edges : new DataSet([
    {from: 1, to: 1},
    {from: 1, to: 2, arrows: "to"},
    ])};
}
