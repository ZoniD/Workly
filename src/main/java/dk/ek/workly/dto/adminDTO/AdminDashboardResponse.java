package dk.ek.workly.dto.adminDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminDashboardResponse {
        final private long pendingEntrepreneurs;
        final private long approvedEntrepreneurs;
        final private long activeEntrepreneurs;
        final private long registeredUsers;
        final private long publishedNews;
    }


