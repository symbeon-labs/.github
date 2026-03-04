const fs = require('fs');
const { execSync } = require('child_process');

async function updateMetrics() {
    const org = 'symbeon-labs';
    const filePath = 'profile/README.md';
    let readme = fs.readFileSync(filePath, 'utf8');

    try {
        // Fetch all public repos for the org
        const response = execSync(`gh repo list ${org} --json name,stargazerCount,forkCount,description --limit 100`, {
            env: { ...process.env, PATH: process.env.PATH }
        });
        const repos = JSON.parse(response.toString());

        const totalStars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
        const totalRepos = repos.length;
        const topRepos = repos
            .sort((a, b) => b.stargazerCount - a.stargazerCount)
            .slice(0, 5)
            .map(r => `| [${r.name}](https://github.com/${org}/${r.name}) | ${r.stargazerCount} | ${r.forkCount} |`)
            .join('\n');

        const metricsSection = `
<!-- START_METRICS -->
### 📊 LABORATORY VITALITY DATA
| STATISTIC | VALUE |
| :--- | :--- |
| **Active Protocols** | ${totalRepos} |
| **Total Ecosystem Stars** | ${totalStars} |

#### TOP RESEARCH MODULES
| REPOSITORY | STARS | FORKS |
| :--- | :--- | :--- |
${topRepos}
<!-- END_METRICS -->`;

        const regex = /<!-- START_METRICS -->[\s\S]*<!-- END_METRICS -->/;
        if (regex.test(readme)) {
            readme = readme.replace(regex, metricsSection);
        } else {
            // Append if not found, before the footer
            readme = readme.replace('---' + '\n' + '<div align="center">', metricsSection + '\n\n---' + '\n' + '<div align="center">');
        }

        fs.writeFileSync(filePath, readme);
        console.log('Metrics updated successfully.');
    } catch (error) {
        console.error('Error fetching metrics:', error.message);
        process.exit(1);
    }
}

updateMetrics();
