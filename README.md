# Dictionary helper

![GitHub License](https://img.shields.io/github/license/kreier/dictionary)
![GitHub Release](https://img.shields.io/github/v/release/kreier/dictionary)

Crowdsourced translation editor UI backed by GitHub PR automation. There are two main goals for this repository

## Web UI helper to translate the [timeline](https://github.com/kreier/timeline)

for helpers in translating phrases for the time

## Helper script to automate translation

The Google translate API works well for a first draft in translating the timeline into more than 200 languages. With context awareness the translations from LLMs like ChatGPT, Claude and Gemini got much better. But you don't have a simple API that you can call. The usual requests use the web interface. 

The helper scripts should create requests that can be copy/pasted into these agents, and then their answer be parsed and integrated to the csv database.

Another helper creates a pull request to the timeline project with the updated translations.
