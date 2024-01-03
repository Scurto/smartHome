package com.smart.smartHome.controller;

import com.smart.smartHome.service.PkService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pk")
@AllArgsConstructor
public class PkController {

    private final PkService pkService;

    @PostMapping("/sound/device")
    public ResponseEntity device(@RequestParam String device) {
        pkService.setAudioDevice(device);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sound/volume")
    public ResponseEntity setVolume(@RequestParam int volume) {
        pkService.setAudioVolume(volume);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sound/volume/change")
    public ResponseEntity changeVolume(@RequestParam int value) {
        pkService.changeAudioVolume(value);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sound/volume")
    public ResponseEntity<Integer> getVolume(@RequestParam String device) {
        return ResponseEntity.ok(pkService.getAudioVolume(device));
    }


}
