import { IRuleMetadata } from "tslint";

export interface SonarRuleMetaData extends IRuleMetadata {
    rspecKey: string;
}
