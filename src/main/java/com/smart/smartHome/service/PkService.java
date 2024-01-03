package com.smart.smartHome.service;

public interface PkService {

    void setAudioDevice(String device);

    void setAudioVolume(int volume);

    void changeAudioVolume(int value);

    Integer getAudioVolume(String device);
}
