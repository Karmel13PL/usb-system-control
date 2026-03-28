import { describe, expect, it } from "vitest";

import { resolveUsbPolicy } from "../domain/policies/resolve-usb-policy.js";

describe("resolveUsbPolicy", () => {
  it("allows every device for allow_all policy", () => {
    expect(
      resolveUsbPolicy({
        policyMode: "allow_all",
        isKnownDevice: false,
      }),
    ).toEqual({
      allowUsb: true,
      reason: "policy_allows_every_device",
    });
  });

  it("blocks every device for block_all policy", () => {
    expect(
      resolveUsbPolicy({
        policyMode: "block_all",
        isKnownDevice: true,
      }),
    ).toEqual({
      allowUsb: false,
      reason: "policy_blocks_every_device",
    });
  });

  it("allows only known devices for whitelist_only policy", () => {
    expect(
      resolveUsbPolicy({
        policyMode: "whitelist_only",
        isKnownDevice: true,
      }),
    ).toEqual({
      allowUsb: true,
      reason: "device_is_on_whitelist",
    });
  });

  it("blocks unknown devices for whitelist_only policy", () => {
    expect(
      resolveUsbPolicy({
        policyMode: "whitelist_only",
        isKnownDevice: false,
      }),
    ).toEqual({
      allowUsb: false,
      reason: "device_is_not_on_whitelist",
    });
  });
});
