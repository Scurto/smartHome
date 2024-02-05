package com.smart.smartHome.controller;

import com.smart.smartHome.controller.listener.WebsocketChromeListener;
import com.smart.smartHome.model.Greeting;
import com.smart.smartHome.model.chrome.ChromeTab;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;

@RestController
@RequestMapping("/chrome")
@AllArgsConstructor
public class ChromeController {

    private final SimpMessagingTemplate template;
    private final WebsocketChromeListener listener;

    @GetMapping("/tabs")
    public ArrayList<ChromeTab> tabs() throws InterruptedException {
        ArrayList<ChromeTab> response = new ArrayList<>();

        response.addAll(fetchTabs(0));
        listener.setTabs(null);
        return response;
    }

    @PostMapping("/executeScript")
    public String tab(@RequestBody ChromeTab chromeTab) throws InterruptedException {
        template.convertAndSend("/chrome/executeScript", chromeTab);
        return "OK";
    }

    private ArrayList<ChromeTab> fetchTabs(int i) throws InterruptedException {
        template.convertAndSend("/chrome/tabs", new Greeting("Fire"));
        Thread.sleep(500);
        if (listener.getTabs() == null) {
            i++;
            if (i == 5) {
                throw new RuntimeException("too many connections");
            }
            return fetchTabs(i);
        }
        return listener.getTabs();
    }
}
