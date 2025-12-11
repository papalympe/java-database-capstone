package com.project.back_end.controllers;

import com.project.back_end.models.Admin;
import com.project.back_end.services.ServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("${api.path}admin")
public class AdminController {

    private final ServiceManager serviceManager;

    public AdminController(ServiceManager serviceManager) {
        this.serviceManager = serviceManager;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> adminLogin(@RequestBody Admin admin) {
        return serviceManager.validateAdmin(admin);
    }
}
