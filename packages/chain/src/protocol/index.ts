import { VanillaProtocolModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

const modules = VanillaProtocolModules.mandatoryModules({}); // VanillaProtocolModules.with({});

const config: ModulesConfig<typeof modules> = {
  // ...VanillaProtocolModules.defaultConfig(),
  ...VanillaProtocolModules.mandatoryConfig()
};

export default { modules, config };
