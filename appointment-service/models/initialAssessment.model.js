const mongoose = require('mongoose');

const DietSchema = new mongoose.Schema({
  name: String,
  timeframe: String,
  supervision: String,
}, { _id: false });

const RelapseSchema = new mongoose.Schema({
  count: Number,
  context: String,
}, { _id: false });

const LeisureActivitySchema = new mongoose.Schema({
  name: String,
  intensity: String,
  duration: Number,
  frequency: String,
}, { _id: false });

const DomesticActivitySchema = new mongoose.Schema({
  name: String,
  intensity: String,
}, { _id: false });

const SnackSchema = new mongoose.Schema({
  time: String,
  frequency: String,
  triggers: String,
  reason: String,
  foods: String,
  quantity: Number,
}, { _id: false });

const MealSchema = new mongoose.Schema({
  time: String,
  setting: String,
  company: String,
  location: String,
  speed: String,
  secondServing: Boolean,
}, { _id: false });

const FoodItemSchema = new mongoose.Schema({
  type: String,
  frequency: String,
}, { _id: false });

const InitialAssessmentSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: String, required: true },
  data: {
    weightHistory: {
      startAge: String,
      triggeringEvents: String,
      lowestAdultWeight: Number,
      highestAdultWeight: Number,
      recentChanges: {
        gainOrLoss: String,
        amount: Number,
        since: String,
        reason: String,
      },
      diets: [DietSchema],
      relapses: [RelapseSchema],
      idealWeight: Number,
    },
    physicalActivity: {
      profession: String,
      workSchedule: String,
      workIntensity: String,
      domesticActivities: [DomesticActivitySchema],
      leisureActivities: [LeisureActivitySchema],
      transport: {
        mode: String,
        dailyTime: Number,
        stairsPreference: String,
      }
    },
    sedentaryHabits: {
      screenTime: Number,
      sittingTime: Number
    },
    eatingHabits: {
      meals: [MealSchema],
      snacks: [SnackSchema],
      skippedMeals: String,
      nightEating: String,
      sensations: {
        hunger: String,
        appetite: String,
        fullness: String,
        satiety: String
      },
      portionSize: String,
      foodPurchasing: {
        who: String,
        where: String,
        when: String,
        quantity: Number,
        storage: String
      },
      mealPreparation: {
        who: String,
        cookingMethod: String,
        seasoning: String
      }
    },
    foodIntake: {
      sugaryDrinks: Number,
      alcoholicDrinks: Number,
      highEnergyFoods: [FoodItemSchema],
      lowEnergyFoods: [FoodItemSchema]
    }
  }
});

module.exports = mongoose.model('InitialAssessment', InitialAssessmentSchema);
