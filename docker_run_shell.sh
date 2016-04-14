#!/bin/bash
docker build --tage mark_img:0.1
docker run -itd -p 81:3000 --name mark_con mark_img:0.1
