import {Network} from "vis";
import {CFG} from "../../cfg/cfg";
import {toVisData} from "./transformer";

class Viewer {

  private container: any;

  constructor(container: any) {
    this.container = container;
  }

  public show(source: string) {
    const graph = new Network(this.container, toVisData(), {});
  }

}

const container = document.getElementById('cfg-container');
const viewer = new Viewer(container);
viewer.show("if(a) { b = 3; } else { b = 1; }");
