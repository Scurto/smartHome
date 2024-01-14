package com.smart.smartHome.model.chrome;

import lombok.Data;

@Data
public class ChromeTab {
    private Integer id;
    private Integer windowId;
    private String title;
    private String url;
    private Boolean active;
    private Boolean selected;
    private String event;
}
