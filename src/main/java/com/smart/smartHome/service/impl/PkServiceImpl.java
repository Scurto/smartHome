package com.smart.smartHome.service.impl;

import com.smart.smartHome.common.PkDevice;
import com.smart.smartHome.service.PkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PkServiceImpl implements PkService {

    @Value("classpath:svcl/svcl.exe")
    Resource svclExeFile;

    @Value("classpath:nircmd/nircmd.exe")
    Resource nircmdExeFile;

    public void setAudioDevice(String device) {
        Runtime rt = Runtime.getRuntime();
        Process pr;
        try {
            pr = rt.exec(nircmdExeFile.getFile().getAbsolutePath() + " setdefaultsounddevice " + device);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void setAudioVolume(int volume) {
        if (volume < 0 || volume > 100) {
            throw new RuntimeException("Error: " + volume + " is not a valid number. Choose a number between 0 and 100");
        } else {
            double endVolume = 655.35 * volume;
            Runtime rt = Runtime.getRuntime();
            Process pr;
            try {
                pr = rt.exec(nircmdExeFile.getFile().getAbsolutePath() + " setsysvolume " + endVolume);
                pr = rt.exec(nircmdExeFile.getFile().getAbsolutePath() + " mutesysvolume 0");

            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void changeAudioVolume(int value) {
        Runtime rt = Runtime.getRuntime();
        try {
            double endVolume = 655.35 * value;
            rt.exec(nircmdExeFile.getFile().getAbsolutePath() + " changesysvolume " + endVolume);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Integer getAudioVolume(String device) {
        Runtime rt = Runtime.getRuntime();
        StringBuilder result = new StringBuilder();
        try {
            Process pr = rt.exec(svclExeFile.getFile().getAbsolutePath() + " /Stdout /GetPercent " + device);
            InputStream is = pr.getInputStream();
            int i = 0;
            while( (i = is.read() ) != -1) {
                result.append((char)i);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return Double.valueOf(result.toString()
                .replaceAll("\\r", "")
                .replaceAll("\\n", "")).intValue();
    }
}
