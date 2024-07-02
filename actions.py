# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
import wikipediaapi
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionSearchWikipedia(Action):
    def name(self) -> Text:
        return "action_search_wikipedia"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get the latest entity value for 'subject'
        entity = next(tracker.get_latest_entity_values('subject'), None)

        # If no entity is found, send a message to the user
        if not entity:
            dispatcher.utter_message(text="I don't understand the question you asked.")
            return []

        # Initialize the Wikipedia API
        wiki_wiki = wikipediaapi.Wikipedia('en')
        page = wiki_wiki.page(entity)

        # If the page does not exist, inform the user
        if not page.exists():
            dispatcher.utter_message(text=f"I don't know anything about {entity}.")
            return []

        # Get the summary of the page (first 500 characters)
        summary = page.summary[0:500]

        # Send the summary to the user
        dispatcher.utter_message(text=f"Here's what I know about {entity}: {summary}")

        return []