package com.smart.smartHome.common;

public enum PkDevice {

    LG("LG"),
    SPEAKERS("Speakers");

    private final String value;

    PkDevice(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
