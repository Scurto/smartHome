package com.smart.smartHome.driver;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class OperaDriverTest {

    public static void main(String[] args) {
        System.setProperty("webdriver.chrome.driver", "C:\\Users\\ustymenkoy\\projectsTest\\smartHome\\src\\main\\resources\\chromedriver\\chromedriver.exe");
        ChromeOptions options = new ChromeOptions();
        options.addArguments("user-data-dir=C:\\Users\\ustymenkoy\\AppData\\Local\\Google\\Chrome\\User Data");
        options.addArguments("profile-directory=Profile 3");
        WebDriver driver=new ChromeDriver(options);

        driver.manage().window().maximize();
        driver.get("https://profitcentr.com/work-task-read?adv=1068153");
        WebElement goform=driver.findElement(By.name("goform"));
        System.out.println(goform);
//        WebElement password=driver.findElement(By.id("user_password"));
//        WebElement login=driver.findElement(By.name("commit"));
//        username.sendKeys("abc@gmail.com");
//        password.sendKeys("your_password");
//        login.click();
//        String actualUrl="https://live.browserstack.com/dashboard";
//        String expectedUrl= driver.getCurrentUrl();
//        Assert.assertEquals(expectedUrl,actualUrl);

    }
}
