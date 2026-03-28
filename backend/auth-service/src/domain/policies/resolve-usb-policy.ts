export type UsbPolicyMode = "allow_all" | "block_all" | "whitelist_only";

export interface ResolveUsbPolicyInput {
  policyMode: UsbPolicyMode;
  isKnownDevice: boolean;
}

export interface UsbPolicyDecision {
  allowUsb: boolean;
  reason: string;
}

export function resolveUsbPolicy(
  input: ResolveUsbPolicyInput,
): UsbPolicyDecision {
  switch (input.policyMode) {
    case "allow_all":
      return { allowUsb: true, reason: "policy_allows_every_device" };
    case "block_all":
      return { allowUsb: false, reason: "policy_blocks_every_device" };
    case "whitelist_only":
      return input.isKnownDevice
        ? { allowUsb: true, reason: "device_is_on_whitelist" }
        : { allowUsb: false, reason: "device_is_not_on_whitelist" };
    default: {
      const exhaustiveCheck: never = input.policyMode;
      return exhaustiveCheck;
    }
  }
}
