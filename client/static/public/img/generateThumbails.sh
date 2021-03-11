#!/bin/sh

for i in *.jpg
do
  convert "$i" -resize 200 thumbails/"$i"
done