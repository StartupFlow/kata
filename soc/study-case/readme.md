# SOC Study Case

## Description and main purpose
The situation presented below is not the one we are facing in the company, but it is close. So the general problems faced by the company will be the same but not the infrastructure or the problems described.
The main purpose is to understand your thinking process, so there is no good or bad answers. Just be sure to explaine them and argument them.

## Context

We are a growing company that works with a lot of big companies around cash flows. We face a lot of scrutiny around our security processes and security enforcement.

We can be deployed inside the cloud host of our client's choosing (AWS, AZURE, OVH, etc). We have microservices with a messaging transporter (Nats), Nginx as reverse-proxy, and a MongoDB Cluster with Redis for the cache management.
Our whole application is run inside Docker Swarm.


## Questions

 * What are the principal security risks in the platform?
 * What are the most important policies the "development" team must follow for security purpose?
 * Propose a template for a **POST-INCIDENT REVIEW**? 
 * After a data breach for Client-company-One, where only machine metrics where accessed, prepare an "Post-Incident Communication" for the client administrator?

### Optional questions

 * Do you know security risks within the Docker technology?
 * What are the first KPIs you would start monitoring?
