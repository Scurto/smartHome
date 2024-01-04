package com.smart.smartHome.controller.listener;

import com.smart.smartHome.model.Greeting;
import com.smart.smartHome.model.chrome.ChromeTab;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebsocketChromeListener {

    private ArrayList<ChromeTab> tabs;

    @MessageMapping("/tabs/response")
    public void tabsResponse(ArrayList<ChromeTab> tabs) throws Exception {
//        System.out.println("tabsResponse");
        setTabs(tabs);
    }

    public ArrayList<ChromeTab> getTabs() {
        return tabs;
    }

    public void setTabs(ArrayList<ChromeTab> tabs) {
        this.tabs = tabs;
    }
}
