import axios from 'axios';
import https from 'node:https';

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      const url = new URL(req.url);
      const method = req.method;
      const args = url.searchParams;
      const access_token = args.get('access_token');
      if (url.pathname === '/favicon.ico') {
        return new Response(null, { status: 204 });
      }
      if (url.pathname === '/') {
        return RootPage();
      }
      // request original rebble boot
      const boot_url = `https://boot.rebble.io/api/stage2${url.pathname}?access_token=${access_token}`;
      
      try {
        // Convert headers from Headers object to plain object
        const headersObject = Object.fromEntries(req.headers.entries());
        
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false
          });

        // Make request with axios
        const boot_res = await axios({
            url: boot_url,
            httpsAgent: httpsAgent // Add the custom agent here
          });
        
        // Log axios response
        console.log(boot_res.status, boot_res.statusText);

        //overwrite config.health
        boot_res.data.config.health = {
            "post_activity_endpoint": "https://health-write-api.fnws.funnyna.me/v1/activity", 
            "post_settings_endpoint": "https://health-write-api.fnws.funnyna.me/v1/settings"
        };

        boot_res.data.config.weather = {
          "provider_name": "Open-Meteo",
          "url": "https://weather.fnws.funnyna.me/weather?lat=$$latitude$$&lon=$$longitude$$&units=$$units$$"
        }
        
        // Convert axios response to Bun Response
        return Response.json(boot_res.data);
      } catch (error) {
        console.error('Error fetching from Rebble boot server:', error);
        
        if (axios.isAxiosError(error) && error.response) {
          return new Response(error.response.data, {
          });
        }
        
        return new Response('Internal Server Error', { status: 500 });
      }
    },
});

function RootPage (): Response {
  //return index.html which is a local file
  const html = Bun.file('index.html');
  return new Response(html);
}
  
console.log(`Server running at http://localhost:${server.port}`);